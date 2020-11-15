const Course = require("../models/Course");

module.exports = {

    treatAchievements: async (user, achievement) => {

        var verification = achievement.operator + " " + achievement.value;

        switch(achievement.field) {

            case "email":
                {
                    if(eval("user.email " + verification)) {
                        user.achievements.push(achievement);
                        return true;
                    }

                    break;
                }

            case "courses":
                {
                    if(eval("user.courses.length " + verification)) {
                        user.achievements.push(achievement);
                        return true;
                    }

                    break;
                }
            case "completed_modules":
                {
                    if(eval("user.completed_modules.length " + verification)) {
                        user.achievements.push(achievement);
                        return true;
                    }

                    break;
                }
            case "completed_courses":
                {
                    let completed_modules = user.completed_modules;

                    let started_courses = await Course.find({ modules: {$in: completed_modules} });

                    //Os cursos completados são aqueles cujos módulos estão todos contidos em completed_courses
                    let completed_courses = [];

                    started_courses.forEach(function(course) {

                        if(course.modules.every(function(module) {
                            return completed_modules.includes(module);
                        }))

                        {
                            //Se o curso passar no teste, significa que ele foi completado
                            completed_courses.push(course);
                        }

                    });

                    if(eval("completed_courses.length " + verification)) {
                        user.achievements.push(achievement);
                        return true;
                    }
                }
                break;

            case "authored_courses":
                {
                    let authored_courses = await Course.find({ author_id:user._id });

                    if(eval("authored_courses.length " + verification)) {
                        user.achievements.push(achievement);
                        return true;
                    }

                    break;
                }
            case "completed_courses_categories":
                {
                    let completed_modules = user.completed_modules;
                    
                    let started_courses = await Course.find({ modules: {$in: completed_modules} });

                    let categories = [];

                    started_courses.forEach(function(course) {

                        if(course.modules.every(function(module) {
                            return completed_modules.includes(module);
                        }))

                        {
                            //Se o curso passar no teste, significa que ele foi completado
                            if(!categories.includes(course.category)) categories.push(course.category);
                        }

                    });

                    if(eval("categories.length " + verification)) {
                        user.achievements.push(achievement);
                        return true;
                    }
                }
                break;

            case "categories_completed_courses":
                {
                    let completed_modules = user.completed_modules;
                    
                    let started_courses = await Course.find({ modules: {$in: completed_modules} });

                    let categories_completed_courses = {};

                    started_courses.forEach(function(course) {

                        if(course.modules.every(function(module) {
                            return completed_modules.includes(module);
                        }))

                        {
                            //Se o curso passar no teste, significa que ele foi completado
                            if(categories_completed_courses[course.category] === undefined) {
                                categories_completed_courses[course.category] = 1;
                            }
                            else {
                                categories_completed_courses[course.category]++;
                            }
                        }

                    });

                    let greatest_quantity = 0;

                    for (let x in categories_completed_courses) {
                        if(categories_completed_courses[x] > greatest_quantity) greatest_quantity = categories_completed_courses[x];
                    }

                    if(eval("greatest_quantity " + verification)) {
                        user.achievements.push(achievement);
                        return true;
                    }
                }
                break;

            default:
                throw "treatAchievementError: Property not found.";

        }

        return false;

    }

}