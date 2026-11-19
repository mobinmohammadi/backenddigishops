const productControllers = require('../controllers/productsControllers')
const { authAdminMiddlewares } = require('../middlewares/authAdminMiddlewares')

const router = require('express').Router()


router.post("/add-product" ,authAdminMiddlewares, productControllers.add_product)
router.get("/get-all-products" ,authAdminMiddlewares, productControllers.get_all_products)
router.get("/deactive-product" ,authAdminMiddlewares, productControllers.get_deactive_product)
router.get("/active-product" ,authAdminMiddlewares, productControllers.get_active_product)
router.post("/delete-product" ,authAdminMiddlewares, productControllers.delete_product)
router.get("/total-stock-product" ,authAdminMiddlewares, productControllers.total_stock)
router.get("/not-count-product" ,authAdminMiddlewares, productControllers.not_count_product)



module.exports = router