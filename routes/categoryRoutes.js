const categoryControllers = require('../controllers/categoryControllers')
const { authAdminMiddlewares } = require('../middlewares/authAdminMiddlewares')
const { authMiddleware } = require('../middlewares/authMiddlewares')

const router = require('express').Router()


router.post("/add-category" ,authAdminMiddlewares, categoryControllers.add_category)
router.post("/add-sub-category" ,authAdminMiddlewares, categoryControllers.add_sub_category)
router.get("/get-all-category" ,authAdminMiddlewares, categoryControllers.get_all_category)
router.get("/get-sub-category" ,authAdminMiddlewares, categoryControllers.get_sub_category)
router.get("/get-active-category" ,authAdminMiddlewares, categoryControllers.get_active_category)
router.get("/get-deactive-category" ,authAdminMiddlewares, categoryControllers.get_deactive_category)



module.exports = router