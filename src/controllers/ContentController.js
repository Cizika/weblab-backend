const Content = require('../models/Content');
const Module = require("../models/Module");
const Course = require("../models/Course");
const ObjectId = require('mongoose').Types.ObjectId;
const path_auth = '../config/auth.json';
const pathsJSON = require('../config/paths.json');
let authConfig = require(path_auth);

module.exports = {

    //Função para inserir um Conteúdo no banco de dados (Inserir Conteúdo)
    async store(req, res) {

        //Campos da requisição (Tipo e Id do Módulo)
        const {type, module_id} = req.body;

        //Tratamento para a fonte de dados
        let source = "";

        if(req.file) {
            source = pathsJSON.upload.Content + type + "/" + req.file.filename;
        }

        else if(req.body.source) {
            source = req.body.source;
        }

        else {
            return res.json({error:"Não foi recebida nenhuma forma de conteúdo."})
        }

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
            return res.status(401).json({error: "Sem permissão para criar um conteúdo no módulo desse curso."});

        //Inserção do registro
        let content = await Content.create({
            type,
            source
        })

        //Inserção do Conteúdo em Módulo
        module.items.push({item:content, type:"Content"});
        module.save("done");

        return res.json(content);

    },

    //Função para alterar um Conteúdo no banco de dados (Editar Conteúdo)
    async update(req, res) {

        //Campos da requisição (Id, Tipo e Id do Módulo)
        const {id, type, module_id} = req.body;

        //Tratamento para a fonte de dados
        let source = "";

        if(req.file) {
            source = pathsJSON.upload.Content + type + "/" + req.file.filename;
        }

        else {
            source = req.body.source;
        }

        //Definições para checar a sessão
        authConfig = require(path_auth);
        var blacklist = authConfig.blacklist;

        //Verificar se a sessão foi inicializada
        if(blacklist.includes(req.token))
            return res.json({error:"Sessão não inicializada"})

        //Verificar se o ID do usuário é válido
        if(!ObjectId.isValid(req.userID))
            return res.status(400).json({error: "Id de usuário inválido."});

        //Verificar se o ID do conteúdo é válido
        if(!ObjectId.isValid(id))
            return res.status(400).json({error: "Id de conteúdo inválido."});

        let content = await Content.findOne({_id: id});

        //Verificar se o registro existe
        if(!content)
            return res.status(400).json({error: "O conteúdo procurado não existe."});

        //Verificar se o ID do módulo é válido
        if(!ObjectId.isValid(module_id))
            return res.status(400).json({error: "Id de módulo inválido."});
    
        let module = await Module.findOne({_id: module_id});
    
        //Verificar se o registro existe
        if(!module)
            return res.status(400).json({error: "O módulo procurado não existe."});

        //Verificar se o conteúdo existe dentro do módulo
        let moduleContentId = module.items.map(function(e) {return e.item}).indexOf(content._id);

        if(moduleContentId == -1)
            return res.status(400).json({error: "O conteúdo procurado não existe dentro do módulo."});

        //Verificar se o curso existe
        let course = await Course.findOne({modules: module});
        
        if(!course)
            return res.status(400).json({error: "O módulo procurado não existe em nenhum curso."});

        //Verificar se o usuário é criador do curso
        if(!course.author_id.equals(req.userID))
            return res.status(401).json({error: "Sem permissão para alterar qualquer conteúdo no módulo desse curso."});

        //Alteração do registro
        let newContent = await Content.findByIdAndUpdate({_id: id}, {
            type:type,
            source:source
        }, {new: "true"});

        //Alteração de Conteúdo em Módulo
        module.items.splice(moduleContentId, 1, {item:newContent, type:"Content"});
        module.save("done");

        //Resposta do processo
        return res.json(newContent);

    },

    //Função para excluir um Conteúdo no banco de dados (Excluir Conteúdo)
    async delete(req, res) {

        //Campos da requisição (Id do Conteúdo e Id do Módulo)
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

        //Verificar se o ID do conteúdo é válido
        if(!ObjectId.isValid(id))
            return res.status(400).json({error: "Id de conteúdo inválido."});

        let content = await Content.findOne({_id: id});

        //Verificar se o registro existe
        if(!content)
            return res.status(400).json({error: "O conteúdo procurado não existe."});

        //Verificar se o ID do módulo é válido
        if(!ObjectId.isValid(module_id))
            return res.status(400).json({error: "Id de módulo inválido."});
    
        let module = await Module.findOne({_id: module_id});
    
        //Verificar se o registro existe
        if(!module)
            return res.status(400).json({error: "O módulo procurado não existe."});

        //Verificar se o conteúdo existe dentro do módulo
        let moduleContentId = module.items.map(function(e) {return e.item}).indexOf(content._id);

        if(moduleContentId == -1)
            return res.status(400).json({error: "O conteúdo procurado não existe dentro do módulo."});

        //Verificar se o curso existe
        let course = await Course.findOne({modules: module});
        
        if(!course)
            return res.status(400).json({error: "O módulo procurado não existe em nenhum curso."});

        //Verificar se o usuário é criador do curso
        if(!course.author_id.equals(req.userID))
            return res.status(401).json({error: "Sem permissão para excluir qualquer conteúdo no módulo desse curso."});

        //Exclusão do registro
        let oldRegister = await Content.findOneAndDelete({_id: id});

        //Exclusão do Módulo em Curso
        module.items.splice(moduleContentId, 1);
        module.save("done");

        //Resposta do processo
        return res.json(oldRegister);

    },

    //Função que procura por um Conteúdo via id (Conteúdo)
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
            return res.status(400).json({error: "Id de conteúdo inválido."});
    
        let content = await Content.findOne({_id: id});
    
        if(!content)
            return res.status(400).json({error: "O conteúdo procurado não existe."});

        //Retorna o registro encontrado
            return res.json(content);

    }

}