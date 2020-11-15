const Course = require("../models/Course");
const User = require("../models/User");
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {

    //Função para cadastrar um curso no banco de dados
    async store(req,res){
        //Recebendo os campos da requisição (Nome, Descrição e Id da categoria)
        const {name, description, category} = req.body;
        //Capturando o ID da sessão que está criando o curso
        const author_id = req.userID;

        //Verificando se a sessão foi inicializada
        if(!author_id)
           return res.json({error: "Sessão não inicializada"});

        if(!name)
           return res.json({error: "O curso deve possuir um nome"});

        if(!category)
           return res.json({error: "Selecione uma categoria"});

        if(!req.file)
            return res.json({error: "Thumbnail obrigatória para o cadastro"});

        const thumbnail = req.file.filename;

        //Criando registro no banco de dados
        const course = await Course.create({
            name,
            description,
            category,
            author_id,
            thumbnail
        });

        return res.json({course})
    },

    //Função para atualizar um curso no banco de dados
    async update(req, res){
        //Recebendo os campos da requisição (Id, Nome, Descrição e Id da categoria)
        const {id, name, description, category} = req.body;
        //Capturando o ID da sessão que está criando o curso
        const user_id = req.userID;

        //Verificando se a sessão foi inicializada
        if(!user_id)
           return res.status(400).json({error: "Sessão não inicializada"});

        if(!req.file)
            return res.status(400).json({error: "Thumbnail obrigatória para o cadastro"});
            
        //Verificando se o ID do curso é válido
        if(!ObjectId.isValid(id))
            return res.status(400).json({error: "Id de curso inválido."});

        const thumbnail = req.file.filename;

        //Buscando pelo registro no banco de dados
        const course = await Course.findOne({_id: id});

        if(!course)
            return res.status(400).json({error: "O curso procurado não existe."});

        //Verificando se o usuário é autor do curso
        if(!course.author_id.equals(user_id))
            return res.status(401).json({error: "Sem permissão para editar este curso."});

        //Alteração do registro
        let newCourse = await Course.findByIdAndUpdate({_id: id}, {
            name:name,
            description:description,
            category:category,
            thumbnail:thumbnail
        }, {new: "true"});


        return res.json({newCourse});
    },

    async findByName(req,res){
        const { name } = req.body;
        const reqUser = req.userID;
        var regex = new RegExp(["^", name, "$"].join(""), "i");

        const course = await Course.find({$text:{$search: regex}})

        if(!reqUser)
           return res.json({error: "Sessão não inicializada"});

       if(!course)
           return res.json({error: "Nenhum curso encontrado"});
       return res.json(course);
    },

    async findById(req,res){
        const { id } = req.query;
        const reqUser = req.userID;
        const api = {};

        var course = await Course.findOne({_id:id});
        const user = await User.findOne({_id:reqUser});

        if(!reqUser)
           return res.json({error: "Sessão não inicializada"});

       if(!course)
           return res.json({error: "Curso não encontrado"});

        api.isSubscribed= user.courses.some((curso)=>{
            return curso.equals(course._id)
        });

        api.curso = course;

       return res.json(api); 
    },

    async createdCourses(req,res){
        var {id} = req.query;
        const courses = await Course.find({});
        var meusCursos = [];

        if(!id)
            id = req.userID;

        courses.forEach(curso => {
            if(curso.author_id.equals(id))
                meusCursos.push(curso);
        });
        
        return res.json(meusCursos);
    },
    
    async index(req,res){
        const courses = await Course.find({})

        return res.json(courses)
    },

    async indexCategory(req,res){
        const {id} = req.query;
        const courses = await Course.find({});
        var cursos = [];

        courses.forEach(curso => {
            if(curso.category.equals(id))
            cursos.push(curso);
        });

        return res.json(cursos);
    }

}