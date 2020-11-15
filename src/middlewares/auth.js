const jwt = require('jsonwebtoken')

module.exports = (req, res, next) =>{
    //Capturando Token da sessão do usuário
    const authHeader = req.headers.authorization;

    //Verificando se o token foi enviado no headers da requisição
    if(!authHeader)
        return res.status(401).json({error: "Token não enviado"})
    
    //Separando a String da autorização em um Array
    const parts = authHeader.split(' ')

    //Verificando se o Array que contém a autorização possui o tamanho esperado
    if(!parts.length === 2)
        return res.status(401).json({error: "Erro com Token"})
    
    //Atribuindo parts[0] à constante scheme e parts[1] ao token
    const [scheme, token] = parts

    //Verificando se o scheme está formato corretamente
    if(!/^Bearer$/i.test(scheme))
        return res.status(401).json({error: "Token mal formatado"})

    //Conferindo se o Token corresponde ao padrão da Autenticação do Sistema (secret)
    jwt.verify(token, process.env.SESSION_SECRET, (err, decoded)=> {
        if(err) return res.status(401).json({error: "Token inválido. Realiza o login novamente."})
    
    //Gravando o Token e o Id do usuário na header para que ele tenha permissão de acessar outras funcionalidades
    if(!req.userID)
        req.userID = decoded.id
    if(!req.token)
        req.token= token

    return next()
    })
    }