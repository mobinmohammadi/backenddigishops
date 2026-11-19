const storyControllers = require('../controllers/storyControllers')
const { authAdminMiddlewares } = require('../middlewares/authAdminMiddlewares')

const router = require('express').Router()


router.post("/add-story" ,authAdminMiddlewares, storyControllers.add_story)
router.get("/get-all-stories", storyControllers.get_stories)




module.exports = router