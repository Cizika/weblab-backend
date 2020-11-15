const Module = require("../models/Module");
const Course = require("../models/Course");
const ObjectId = require('mongoose').Types.ObjectId;

const path_auth = '../config/auth.json'
let authConfig = require(path_auth);

module.exports = {

    //Função para inserir um Módulo no banco de dados (Criar Módulo)
    async store(req, res) {

        //Campos da requisição (Nome, Descrição e Id do Curso)
        const {name, description, course_id} = req.body;

        //Definições para checar a sessão
        authConfig = require(path_auth);
        var blacklist = authConfig.blacklist;

        //Verificar se a sessão foi inicializada
        if(blacklist.includes(req.token))
            return res.json({error:"Sessão não inicializada"})

        //Verificar se o ID do usuário é válido
        if(!ObjectId.isValid(req.userID))
            return res.status(400).json({error: "Id de usuário inválido."});

        //Verificar se o ID do curso é válido
        if(!ObjectId.isValid(course_id))
            return res.status(400).json({error: "Id de curso inválido."});

        //Verificar se o curso existe
        let course = await Course.findById(course_id);
        
        if(!course)
            return res.status(400).json({error: "O curso procurado não existe."});

        //Verificar se o usuário é criador do curso
        if(!course.author_id.equals(req.userID))
            return res.status(401).json({error: "Sem permissão para criar um módulo nesse curso."});

        //Inserção do registro
        let module = await Module.create({
            name,
            description
        });
        
        //Inserção do Módulo no Curso
        course.modules.push(module);
        course.save("done");

        //Resposta do processo
        return res.json(module);

    },

    //Função para alterar um Módulo no banco de dados (Editar Módulo)
    async update(req, res) {

        //Campos da requisição (Id, Nome, Descrição e Id do Curso)
        const {id, name, description, course_id} = req.body;

        //Definições para checar a sessão
        authConfig = require(path_auth);
        var blacklist = authConfig.blacklist;

        //Verificar se a sessão foi inicializada
        if(blacklist.includes(req.token))
            return res.json({error:"Sessão não inicializada"})

        //Verificar se o ID do usuário é válido
        if(!ObjectId.isValid(req.userID))
            return res.status(400).json({error: "Id de usuário inválido."});

        //Verificar se o ID do módulo é válido
        if(!ObjectId.isValid(id))
            return res.status(400).json({error: "Id de módulo inválido."});
    
        let module = await Module.findOne({_id: id});
    
        //Verificar se o registro existe
        if(!module)
            return res.status(400).json({error: "O módulo procurado não existe."});

        //Verificar se o ID do curso é válido
        if(!ObjectId.isValid(course_id))
            return res.status(400).json({error: "Id de curso inválido."});

        let course = await Course.findById(course_id);

        //Verificar se o curso existe
        if(!course)
            return res.status(400).json({error: "O curso procurado não existe."});

        //Verificar se o módulo existe dentro do curso
        let courseModuleId = course.modules.indexOf(module._id);

        if(courseModuleId == -1)
            return res.status(400).json({error: "O módulo procurado não existe dentro do curso."});

        //Verificar se o usuário é criador do curso
        if(!course.author_id.equals(req.userID))
            return res.status(401).json({error: "Sem permissão para editar esse módulo."});

        //Alteração do registro
        let newModule = await Module.findByIdAndUpdate({_id: id}, {
            name:name,
            description:description
        }, {new: "true"});

        //Alteração de Módulo em Curso
        course.modules.splice(courseModuleId, 1, newModule);
        course.save("done");

        //Resposta do processo
        return res.json(newModule);

    },

    //Função para excluir um Módulo no banco de dados (Excluir Módulo)
    async delete(req, res) {

        //Campos da requisição (Id do Módulo e Id do Curso)
        const {id, course_id} = req.body;

        //Definições para checar a sessão
        authConfig = require(path_auth);
        var blacklist = authConfig.blacklist;

        //Verificar se a sessão foi inicializada
        if(blacklist.includes(req.token))
            return res.json({error:"Sessão não inicializada"})

        //Verificar se o ID do usuário é válido
        if(!ObjectId.isValid(req.userID))
            return res.status(400).json({error: "Id de usuário inválido."});

        //Verificar se o ID do módulo é válido
        if(!ObjectId.isValid(id))
            return res.status(400).json({error: "Id de módulo inválido."});
    
        let module = await Module.findOne({_id: id});
    
        //Verificar se o registro existe
        if(!module)
            return res.status(400).json({error: "O módulo procurado não existe."});

        //Verificar se o ID do curso é válido
        if(!ObjectId.isValid(course_id))
            return res.status(400).json({error: "Id de curso inválido."});

        let course = await Course.findById(course_id);

        //Verificar se o curso existe
        if(!course)
            return res.status(400).json({error: "O curso procurado não existe."});

        //Verificar se o módulo existe dentro do curso
        let courseModuleId = course.modules.indexOf(module._id);

        if(courseModuleId == -1)
            return res.status(400).json({error: "O módulo procurado não existe dentro do curso."});

        //Verificar se o usuário é criador do curso
        if(!course.author_id.equals(req.userID))
            return res.status(401).json({error: "Sem permissão para excluir esse módulo."});

        //Exclusão do registro
        let oldRegister = await Module.findOneAndDelete({_id: id});

        //Exclusão do Módulo em Curso
        course.modules.splice(courseModuleId, 1);
        course.save("done");

        //Resposta do processo
        return res.json(oldRegister);

    },

    //Função que procura por um Módulo via id (Módulo)
    async findById(req, res) {

        //Campos da requisição (Id)
        const {id} = req.body;

        //Definições para checar a sessão
        authConfig = require(path_auth);
        var blacklist = authConfig.blacklist;

        //Verificar se a sessão foi inicializada
        if(blacklist.includes(req.token))
            return res.json({error:"Sessão não inicializada"})

        //Verificar se o ID do usuário é válido
        if(!ObjectId.isValid(req.userID))
            return res.status(400).json({error: "Id de usuário inválido."});

        //Verificar se o registro existe
        if(!ObjectId.isValid(id))
            return res.status(400).json({error: "Id de módulo inválido."});
    
        let module = await Module.findOne({_id: id});
    
        if(!module)
            return res.status(400).json({error: "O módulo procurado não existe."});

        //Retorna o registro encontrado
            return res.json(module);

    }

}