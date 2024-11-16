import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo, validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';


dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created,
                completed: false
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    // Fetch the user’s todos from the database
    router.get('/fetch-all', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            let todos = await todoRepository.findAll(session.userID);
            return res.status(200).send(todos);
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Failed to fetch todos." });
        }
    });

    // Update todo completed status
    router.post('/toggle-completed/:id', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            const todoID = req.params.id;

            let todo = await todoRepository.findOneByToDoID(todoID);

            if (!todo) {
                return res.status(404).send({ error: "Todo not found." });
            }
            
            let completed = !todo.completed;
            let updatedTodo = await todoRepository.flipComplete(todoID, completed);
            return res.status(200).send(updatedTodo);
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Failed to update todo." });
        }
    });

    // Update todo name
    router.post('/update-name/:id', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            const todoID = req.params.id;

            let todo = await todoRepository.findOneByToDoID(todoID);

            if (!todo) {
                return res.status(404).send({ error: "Todo not found." });
            }

            let updatedTodo = await todoRepository.updateName(todoID, req.body.name);
            return res.status(200).send(updatedTodo);
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Failed to update todo." });
        }
    });

    return router;
}
