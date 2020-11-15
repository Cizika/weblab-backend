const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const Course = require("../models/Course");
const nodemailer = require('nodemailer');
const Achievement = require("../models/Achievement");
const { title } = require("process");
const ObjectId = require('mongoose').Types.ObjectId;

const path_auth = '../config/auth.json'
let authConfig = require(path_auth);

//Função para gerar um token que expira em 10 horas (36000 segundos)
function generateToken(params = {}){
    return jwt.sign(params, process.env.SESSION_SECRET, {
        expiresIn: 36000,
    } )
}

module.exports = {

    //Função para armazenar um Usuário no banco de dados (Cadastro)
    async store(req,res){
        //Recebendo os campos da requisição (Nome, Senha, Email e Avatar)
        const {name, email, password, admin} = req.body;
        let avatar = "";
        let title = "";

        //Verificando se o usuário já não está cadastrado no sistema
        let user = await User.findOne({email: email});
        if(user)
            return res.json({error: "Email já cadastrado no sistema"});

        //Verificando se a senha possui 6 caracteres, apenas números e letras
        if(password.length < 6 || password.match('[^A-Za-z0-9]+'))
            return res.json({error: "A senha deve possuir ao menos 6 caracteres, dentre números ou letras"});

        //Verificando se o usuário enviou uma imagem (Campo Opcional)
        if(req.file)
            avatar= req.file.filename

        //Criando registro no banco de dados
        user = await User.create({
            name,
            email,
            password,
            avatar,
            title,
            admin
        });

        // Após o cadastro, o usuário já inicia a sessão automaticamente
        const token = generateToken({id: user.id})
        return res.json({user,token })
    },
    
    //Função para atualizar os dados do Usuário no banco de dados (Editar)
    async update(req,res){
        //Recebendo os campos da requisição (Nome, Senha, Email e Avatar)
        const {name, email, password, oldPassword} = req.body;
        let avatar;
        let newUser = {};
        authConfig = require(path_auth)
        var blacklist = authConfig.blacklist

    //Verificar se o Token ainda é válido ou se foi adicionado à blacklist caso o usuário já tenha feito logoff
    if(blacklist.includes(req.token))
            return res.json({error:"Sessão não inicializada. Faça o login."})
        
        //Verificando se o usuário realmente existe no banco
        const user = await User.findOne({_id:req.userID});
        if(!user)
            return res.status(400).json({ error: "Usuário não cadastrado no sistema."});
        //Verificando se o usuário enviou uma imagem (Campo Opcional)
        if(req.file){
            avatar = req.file.filename;
            newUser.avatar = avatar;
        }

        //Conferindo a senha para confirmar a ação do usuário
        if(!await bcrypt.compare(oldPassword,user.password))
            return res.json({error: "Senha atual incorreta"})

        if(name.length > 0)
            newUser.name = name;

        if(email.length > 0)
            newUser.email = email;

        //Verificando se a senha possui 6 caracteres, apenas números e letras
        if(password.length > 6 && !password.match('[^A-Za-z0-9]+'))
            newUser.password = password;
        else if(password.length != 0)
            return res.json({error: "A senha deve possuir ao menos 6 caracteres, dentre números ou letras"});

        
        //Atualizando dados no banco de dados
        await User.updateOne({_id: req.userID},newUser)

        return res.json({message:"Edição concluída!"});
    },

    //Função para deletar a conta do usuário no banco de dados (Excluir)
    async delete(req,res){
        const {password,email} = req.body
        //Capturando o usuário a quem queremos deletar a conta
        const user = await User.findOne({email: email})
        //Capturando dados de quem realizou a requisição
        const reqID = req.userID
        const reqUser = await User.findOne({_id: reqID})

        authConfig = require(path_auth)
        var blacklist = authConfig.blacklist
        var adminlist = authConfig.adminlist

        //Verificando se a sessão foi inicializada
        if(blacklist.includes(req.token))
            return res.json({error:"Sessão não inicializada"})
        
        //Verificando se o usuário a quem queremos excluir realmente existe no banco
        if(!user)
            return res.json({error: "E-mail informado incorreto"})

        //Conferindo se o usuário que está requisitando a ação é um administrador ou o dono da conta
        if(!adminlist.includes(req.token) && !user._id === reqID)
            return res.json({error: "Sem permissão para remover o usuário"})

        //Verificando se a senha do usuário requisitante está correta
        if(!await bcrypt.compare(password, reqUser.password))
            return res.json({error: "Senha incorreta"})

        //Removendo usuário do banco de dados
        return res.json(await User.findOneAndDelete({_id: user._id}))
    },

    //Função para iniciar uma sessão no site (Login)
    async login(req,res){
        const {email, password} = req.body;
        //Verificando se o usuário está cadastrado no banco de dados
        const user = await User.findOne({email: email});
        if(!user)
            return res.json({error: "Usuário não cadastrado no sistema"});

        //Autentificando a senha fornecida
        if(!await bcrypt.compare(password,user.password))
            return res.json({error:"Email ou senha incorretos"});
        
        user.password = undefined;

        //Token para autorização de acesso a outras funcionalidades do sistema
        const token = generateToken({id: user.id})

        //Verificando se o usuário tem permissão admin dentro do sistema
        if(user.admin){
            fs.readFile(path.resolve(__dirname, path_auth), 'utf8', function (err, data) {
                if (err) 
                    return res.json({error: "Erro ao realizar login como admin"})
                 else {
                    const file = JSON.parse(data);
                    //Conferindo se o token apresentado já não está na blacklist
                    if(!file.blacklist.includes(req.token)){
                        file.adminlist.push(token);

                        const json = JSON.stringify(file);
            
                        fs.writeFile(path.resolve(__dirname, path_auth), json, 'utf8', function(err){
                                if(err)
                                    return res.json({error: "Erro ao realizar login como admin"})
                        });
                    }
                }
            });
        }
        return res.json({user, token});
    },

    //Função para sair da aplicação (Logoff)
    async logoff(req,res) {

        //Abrindo o arquivo auth.json
        fs.readFile(path.resolve(__dirname, path_auth), 'utf8', function (err, data) {
            
            if (err) 
                return res.json({error: "Erro ao tentar realizar logoff"})

            else {
                const file = JSON.parse(data);
                //Conferindo se o token apresentado já não está na blacklist
                if(!file.blacklist.includes(req.token)){
                    //Adicionando token à blacklist
                    file.blacklist.push(req.token);
                    const json = JSON.stringify(file);
        
                    //Sobrescrevendo Arquivo com a lista atualizada
                    fs.writeFile(path.resolve(__dirname, path_auth), json, 'utf8', function(err){
                            if(err)
                                return res.json({error: "Erro ao tentar realizar logoff"})
                            else 
                                return res.json({message: "Logoff concluído!"})
                            });
                } else
                return res.json({message: "Sessão já encerrada"})
        
            }});
     },

     //Função para retornar dados do usuário com base no id (Aba Perfil)
     async findById(req,res){
         const { id } = req.query;
         const reqUser = req.userID;

         const user = await User.findOne({_id:id});

         if(!reqUser)
            return res.json({error: "Sessão não inicializada"});

        if(!user)
            return res.json({error: "Usuário não encontrado"});
        return res.json(user);
     },

     async findByName(req,res){
        const { name } = req.body;
        const reqUser = req.userID;
        var regex = new RegExp(["^", name, "$"].join(""), "i");

        const user = await User.find({$text:{$search: regex}})

        if(!reqUser)
           return res.json({error: "Sessão não inicializada"});

       if(!user)
           return res.json({error: "Usuário não encontrado"});
       return res.json(user);
    },

     //Função para retornar dados do usuário com base no email (Aba Perfil)
     async findByEmail(req,res){
        const {email}=req.body;
        const reqUser = req.userID;

        const user = await User.findOne({email:email});

        if(!reqUser)
            return res.json({error: "Sessão não inicializada"});
        
        if(!user)
            return res.json({error: "Usuário não encontrado"});
        return res.json(user);
     },

     //Função para retornar meu Perfil
     async myProfile(req,res){
        const reqUser = req.userID;

        if(!reqUser)
            return res.json({error: "Sessão não inicializada"});

        const user = await User.findOne({_id:reqUser});
        
        if(!user)
            return res.json({error: "Usuário não encontrado"});

        return res.json(user);
     },

     //Função para se inscrever em um curso
     async subscribe(req,res){
        const { course } = req.query;
        const reqUser = req.userID;

        if(!reqUser)
           return res.json({error: "Sessão não inicializada"});

        const user = await User.findOne({_id:reqUser});

       if(!user)
           return res.json({error: "Usuário não encontrado"});

        if(user.courses.some((curso)=>{
            return curso.equals(course)
        }))
            user.courses.pull(course);
        else
            user.courses.push(course);
        user.save("done");
        return res.json(user);
     },

     //Função para cancelar a inscrição em determinado curso
     async unsubscribe(req,res){
        const { course } = req.query;
        const reqUser = req.userID;

        if(!reqUser)
            return res.json({error: "Sessão não inicializada"});
        
        const user = await User.findOne({_id:reqUser});
        
        if(!user)
           return res.json({error: "Usuário não encontrado"});

        var Subscribed = user.courses.some(function (course_id) {
            return course_id.equals(course);
        });

        if(!Subscribed)
            return res.json("Usuário não inscrito no curso");

        user.courses.pull(course);
        user.save("done");
        return res.json(user);
     },

     //Função para concluir um módulo
     async completeModule(req,res){
        const { module } = req.query;
        const reqUser = req.userID;

        if(!reqUser)
        return res.json({error: "Sessão não inicializada"});
    
        const user = await User.findOne({_id:reqUser});
     
        if(!user)
            return res.json({error: "Usuário não encontrado"});

        if(!user.courses[0])
            return res.json({error: "Usuário não cadastrado em nenhum curso"});

        user.courses.forEach(async course => {
            const curso = await Course.findOne({_id:course});
            console.log(course)

            curso.modules.forEach(module_id =>{

                if(module_id.equals(module)){

                    user.completed_modules.forEach(completed => {
                        if(completed.equals(module))
                            return res.json({error:"Módulo já completo!"})
                        })
                        user.completed_modules.push(module);
                        user.save("done");
                        return res.json(user);
                    
                }
            });
        }); 
        
     },

     //Função para retornar os cursos do usuário
     async findCourses(req,res){
        var {id} = req.query;
        let cursos = [];
        let completedModules = 0;
        let progress = 0;

        if(!id)
            id=req.userID

        const user = await User.findOne({_id:id});
       if(!user)
           return res.json({error: "Usuário não encontrado"});
       
        for(let i=0;i< user.courses.length; i++){
            var curso = await Course.findOne({_id:user.courses[i]});
        curso.modules.forEach(module => {
                if(user.completed_modules.includes(module))
                    completedModules++;
            });
            
            if(curso.modules.length != 0)
                progress = Math.floor(100 * completedModules/curso.modules.length);

            cursos.push({id:curso.id, name:curso.name,description:curso.description,thumbnail:curso.thumbnail,progress: progress});

            completedModules = 0;
            progress = 0;
        }
        
        return res.json(cursos);
     },

     async notificateError(req,res){
        const reqUser = req.userID;
        const {assunto, descricao} = req.body;

        if(!reqUser)
        return res.json({error: "Sessão não inicializada"});
    
        const user = await User.findOne({_id:reqUser});
     
        if(!user)
            return res.json({error: "Usuário não encontrado no sistema"});

        var remetente = nodemailer.createTransport({
            
            host: "smtp.gmail.com",
            service: "gmail",
            port: 587,
            secure: true,
            auth:{
            user: process.env.ERROR_EMAIL,
            pass: process.env.ERROR_PASS }
            });

        var email = {
            from: process.env.ERROR_EMAIL,
            to: 'equipethecoders@gmail.com',
            subject: 'Erro - '+ assunto,
            text: 'Email do usuário: '+ user.email +'\nDescrição do problema: '+descricao
        }

        remetente.sendMail(email, (error)=>{
            if(error){
                console.log(error);
                return res.json({error: 'Serviço offline. Tente mais tarde!'});
            } else
            return res.json({message: "Problema reportado! Agradecemos pelo Feedback!"});
    
        })
     },

    //Função para mudar o Título do Usuário
    async changeTitle (req, res){
        const { achievement_id } = req.body;
        const reqUser = req.userID;

        if(!reqUser)
            return res.json({error: "Sessão não inicializada"});

        const user = await User.findOne({_id:reqUser});
        
        if(!user)
            return res.json({error: "Usuário não encontrado"});

        //Verificar se o ID da Conquista é válido
        if(!ObjectId.isValid(achievement_id))
            return res.status(400).json({error: "Id de conquista inválido."});

        //Verificar se a conquista existe
        let achievement = await Achievement.findOne({_id: achievement_id});

        if(!achievement)
            return res.status(400).json({error: "A conquista procurada não existe."});
    
        //Verificar se o usuário possui a conquista
        let userAchievementId = user.achievements.map(function(e) {return e}).indexOf(achievement._id);

        if(userAchievementId == -1)
            return res.status(400).json({error: "Este usuário não possui essa conquista."});

        //Alteração do registro
        let newUser = await User.findByIdAndUpdate({_id: reqUser}, {
            title:achievement.title
        }, {new: "true"});

        //Resposta do processo
        return res.json(newUser);
    }

}