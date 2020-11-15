const express = require("express");
const multer = require('multer');

const uploadConfig = require('./config/upload');
const uploadContentConfig = require('./config/uploadContent');

const authMiddleware = require('./middlewares/auth');

const UserController = require("./controllers/UserController");
const ModuleController = require("./controllers/ModuleController");
const CourseController = require("./controllers/CourseController");
const TestController = require("./controllers/TestController");
const ContentController = require("./controllers/ContentController");
const AchievementController = require("./controllers/AchievementController");
const User = require("./models/User");
const CategoryController = require("./controllers/CategoryController");
//const CategoryController = require("./controllers/CategoryController");

const routes = express.Router();

const upload = multer(uploadConfig);
const uploadContent = multer(uploadContentConfig);

routes.get('/', (req, res) => {
    return res.send("Base da Aplicação Concluída!");
});

////Rotas para Usuário

//Rotas em que não é necessário iniciar sessão para acessar
routes.post("/cadastrar", upload.single('avatar'), UserController.store)

routes.post("/entrar", UserController.login)

routes.get("/cursos",CourseController.index);

//Middleware que verifica a sessão do usuário
routes.use(authMiddleware);

//Rotas que só podem ser acessadas com a sessão iniciada
routes.get("/sair", UserController.logoff);

routes.post("/perfil/remover", UserController.delete);

routes.post("/perfil/editar", upload.single('avatar'), UserController.update);

routes.post("/perfil/titulo", UserController.changeTitle);

routes.get("/perfil", UserController.myProfile);

routes.get("/perfil/usuario", UserController.findById);

routes.post("/perfil/email", UserController.findByEmail);

routes.get("/perfil/cursos", UserController.findCourses)

routes.post('/erro', UserController.notificateError)

routes.post('/pesquisa/usuarios',UserController.findByName)

////Rotas para Curso
routes.post("/curso/criar", upload.single('thumbnail'), CourseController.store);

routes.post("/curso/editar", upload.single('thumbnail'), CourseController.update);

routes.get("/curso/inscrever", UserController.subscribe);

routes.get("/curso/cancelar", UserController.unsubscribe);

routes.get("/curso", CourseController.findById);

routes.get("/curso/cadastrados", CourseController.createdCourses);

routes.post('/pesquisa/cursos',CourseController.findByName)

////Rotas para Módulo
routes.post("/modulo/", ModuleController.findById);

routes.post("/modulo/inserir", ModuleController.store);

routes.post("/modulo/editar", ModuleController.update);

routes.post("/modulo/excluir", ModuleController.delete);

routes.get("/modulo/completar", UserController.completeModule);

////Rotas para Conteúdo
routes.post("/conteudo/", ContentController.findById);

routes.post("/conteudo/inserir", uploadContent.single('source'), ContentController.store);

routes.post("/conteudo/editar", uploadContent.single('source'), ContentController.update);

routes.post("/conteudo/excluir", ContentController.delete);

////Rotas para Exercício
routes.post("/exercicio/", TestController.findById);

routes.post("/exercicio/inserir", TestController.store);

routes.post("/exercicio/editar", TestController.update);

routes.post("/exercicio/excluir", TestController.delete);

////Rotas para Categoria
routes.get("/categorias", CategoryController.index);

routes.get("/curso/categoria", CourseController.indexCategory);
//routes.get("/categoria",CategoryController.findByName)

////Rotas para Conquista
routes.post("/desbloquear", AchievementController.unlock);

routes.get("/conquistas", AchievementController.findAll);

routes.post("/conquista", AchievementController.findById);


module.exports = routes;