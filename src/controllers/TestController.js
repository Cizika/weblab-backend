const Test = require('../models/Test');
const Module = require("../models/Module");
const Course = require("../models/Course");
const ObjectId = require('mongoose').Types.ObjectId;

const path_auth = '../config/auth.json'
let authConfig = require(path_auth);

module.exports = {

    //Função para inserir um Exercício no banco de dados (Inserir Exercício)
    async store(req, res) {

        //Campos da requisição (Questão, Respostas, Resposta Correta e Id do Módulo) 
        const {question, answers, correct_answer, module_id} = req.body;

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
        if(!ObjectId.isValid(module_id))
            return res.status(400).json({error: "Id de módulo inválido."});
    
        let module = await Module.findOne({_id: module_id});
    
        //Verificar se o registro existe
        if(!module)
            return res.status(400).json({error: "O módulo procurado não existe."});

        //Verificar se o curso existe
        let course = await Course.findOne({modules: module});
        
        if(!course)
            return res.status(400).json({error: "O módulo procurado não existe em nenhum curso."});

        //Verificar se o usuário é criador do curso
        if(!course.author_id.equals(req.userID))
            return res.status(401).json({error: "Sem permissão para criar um exercício no módulo desse curso."});

        //Inserção do registro
        let test = await Test.create({
            question,
            answers,
            correct_answer
        })

        //Inserção do Exercício em Módulo
        module.items.push({item:test, type:"Test"});
        module.save("done");

        return res.json(test);

    },

    //Função para alterar um Exercício no banco de dados (Editar Exercício)
    async update(req, res) {

        //Campos da requisição (Id, Questão, Respostas, Resposta Correta e Id do Módulo)
        const {id, question, answers, correct_answer, module_id} = req.body;

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
            return res.status(400).json({error: "Id de exercício inválido."});

        let test = await Test.findOne({_id: id});
    
        if(!test)
            return res.status(400).json({error: "O exercício procurado não existe."});

        //Verificar se o ID do módulo é válido
        if(!ObjectId.isValid(module_id))
            return res.status(400).json({error: "Id de módulo inválido."});
    
        let module = await Module.findOne({_id: module_id});
    
        //Verificar se o registro existe
        if(!module)
            return res.status(400).json({error: "O módulo procurado não existe."});

        //Verificar se o curso existe
        let course = await Course.findOne({modules: module});
        
        if(!course)
            return res.status(400).json({error: "O módulo procurado não existe em nenhum curso."});

        //Verificar se o usuário é criador do curso
        if(!course.author_id.equals(req.userID))
            return res.status(401).json({error: "Sem permissão para alterar qualquer exercício no módulo desse curso."});

        //Verificar se o exercício existe dentro do módulo
        let moduleTestId = module.items.map(function(e) {return e.item}).indexOf(test._id);

        if(moduleTestId == -1)
            return res.status(400).json({error: "O exercício procurado não existe dentro do módulo."});

        //Alteração do registro
        let newTest = await Test.findByIdAndUpdate({_id: id}, {
            question:question,
            answers:answers,
            correct_answer:correct_answer
        }, {new: "true"});

        //Alteração de Exercício em Módulo
        module.items.splice(moduleTestId, 1, {item:newTest, type:"Test"});
        module.save("done");

        //Resposta do processo
        return res.json(newTest);

    },

    //Função para excluir um Exercício no banco de dados (Excluir Exercício)
    async delete(req, res) {

        //Campos da requisição (Id do Exercício e Id do Módulo)
        const {id, module_id} = req.body;

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
            return res.status(400).json({error: "Id de exercício inválido."});

        let test = await Test.findOne({_id: id});
    
        if(!test)
            return res.status(400).json({error: "O exercício procurado não existe."});

        //Verificar se o ID do módulo é válido
        if(!ObjectId.isValid(module_id))
            return res.status(400).json({error: "Id de módulo inválido."});
    
        let module = await Module.findOne({_id: module_id});
    
        //Verificar se o registro existe
        if(!module)
            return res.status(400).json({error: "O módulo procurado não existe."});

        //Verificar se o curso existe
        let course = await Course.findOne({modules: module});
        
        if(!course)
            return res.status(400).json({error: "O módulo procurado não existe em nenhum curso."});

        //Verificar se o usuário é criador do curso
        if(!course.author_id.equals(req.userID))
            return res.status(401).json({error: "Sem permissão para excluir qualquer exercício no módulo desse curso."});

        //Verificar se o exercício existe dentro do módulo
        let moduleTestId = module.items.map(function(e) {return e.item}).indexOf(test._id);

        if(moduleTestId == -1)
            return res.status(400).json({error: "O exercício procurado não existe dentro do módulo."});

        //Exclusão do registro
        let oldRegister = await Test.findOneAndDelete({_id: id});

        //Exclusão do Exercício em Módulo
        module.items.splice(moduleTestId, 1)
        module.save("done");

        //Resposta do processo
        return res.json(oldRegister);

    },

    //Função que procura por um Exercício via id (Exercício)
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
            return res.status(400).json({error: "Id de exercício inválido."});
    
        let test = await Test.findOne({_id: id});
    
        if(!test)
            return res.status(400).json({error: "O exercício procurado não existe."});

        //Retorna o registro encontrado
            return res.json(test);

    }

}