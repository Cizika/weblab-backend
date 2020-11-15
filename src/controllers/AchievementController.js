const Achievement = require('../models/Achievement');
const User = require('../models/User');
const ObjectId = require('mongoose').Types.ObjectId;

const AchievementUtil = require('../utils/achievementUtil');

const path_auth = '../config/auth.json'
let authConfig = require(path_auth);

module.exports = {

    async unlock(req, res) {

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

        //Encontrar o usuário
        let user = await User.findOne({_id:req.userID});

        if(!user)
            return res.json({error: "Usuário não encontrado"});

        //Encontrar a conquista
        let achievement = await Achievement.findById({_id:id});

        if(!achievement)
            return res.status(400).json({error: "A conquista procurada não existe."});

        //Verificar se o usuário já possui a conquista
        let userAchievementId = user.achievements.map(function(e) {return e}).indexOf(id);

        if(userAchievementId != -1)
            return res.json({error: "Este usuário já possui essa conquista."});

        try {
            
            if(await AchievementUtil.treatAchievements(user, achievement)) {
                user.save("done");
                return res.json({achievement});
            }
            else {
                return res.json({error: "Este usuário não atingiu os requisitos para desbloquear a conquista ainda."})
            }

        }
        catch(err) {
            console.log("An exception has ocurred!");
            console.log(err);
            return res.status(400).json({error: err})
        }

    },

    async findAll(req, res) {

        //Definições para checar a sessão
        authConfig = require(path_auth);
        var blacklist = authConfig.blacklist;

        //Verificar se a sessão foi inicializada
        if(blacklist.includes(req.token))
            return res.json({error:"Sessão não inicializada"})

        //Verificar se o ID do usuário é válido
        if(!ObjectId.isValid(req.userID))
            return res.status(400).json({error: "Id de usuário inválido."});

        let achievements = await Achievement.find({});
        return res.json(achievements);

    },

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

        let achievement = await Achievement.findById({_id:id});

        if(!achievement)
            return res.status(400).json({error: "A conquista procurada não existe."});

        return res.json(achievement);

    }

}