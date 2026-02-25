import * as uuid from "uuid";
import md5 from "md5";
import { connectDB } from "./connect-db";
import { assembleUserState } from "./utility";

const authenticationTokens = [];

export const authenticationRoute = (app) => {
  app.post("/authenticate", async (request, response) => {
    let { username, password } = request.body;
    let db = await connectDB();
    let collection = db.collection(`users`);

    // 🔥 مهم: جستجو بر اساس id، نه name
    let user = await collection.findOne({ id: username });

    if (!user) {
      return response.status(500).send("User not found");
    }

    let hash = md5(password);
    let passwordCorrect = hash === user.passwordHash;

    if (!passwordCorrect) {
      return response.status(500).send("Password incorrect");
    }

    let token = uuid.v4();

    authenticationTokens.push({
      token,
      userID: user.id,
    });

    let state = await assembleUserState(user);

    response.send({ token, state });
  });

  app.post("/user/create", async (request, response) => {
    let { username, password } = request.body;
    let db = await connectDB();
    let collection = db.collection(`users`);

    let user = await collection.findOne({ name: username });
    if (user) {
      return response
        .status(500)
        .send({ message: "A user with that account name already exists." });
    }

    let userID = uuid.v4();
    let groupID = uuid.v4();

    await collection.insertOne({
      name: username,
      id: userID,
      passwordHash: md5(password),
    });

    await db.collection(`groups`).insertOne({
      id: groupID,
      owner: userID,
      name: `To Do`,
    });

    let state = await assembleUserState({ id: userID, name: username });

    response.status(200).send({ userID, state });
  });
};
