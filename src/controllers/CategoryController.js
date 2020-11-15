const Category = require("../models/Category");
const { index } = require("./CourseController");

module.exports = {

    //Função para cadastrar uma categoria no banco de dados
    async store(req,res){
        //Recebendo os campos da requisição (Nome, Descrição)
        const {name, description} = req.body;

        //Conferindo se o usuário que está requisitando a ação é um administrador
        if(!adminlist.includes(req.token))
            return res.json({error: "Sem permissão para criar categoria"})

        //Criando registro no banco de dados
        categoria = await Category.create({
            name,
            description,
        });

        return res.json({categoria})
    },
    //Função para recuperar o id da categoria pelo seu nome
    async findByName(req,res){
        const {name}=req.query;
        const reqUser = req.userID;

        const categoria = await Category.findOne({name:name});

        if(!reqUser)
            return res.json({error: "Sessão não inicializada"});

        return res.json(categoria._id);

    },

    async index(req,res){
        return res.json(await Category.find({}));
    }

}