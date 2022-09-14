const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo.js");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should response with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
      //expect(response.statusCode).toBe(200); la fel cu jest
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC",
      target: "Kepler-442 b",
      launchDate: "January 4, 2024",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC",
      target: "Kepler-442 b",
    };

    const completeLaunchErrorDate = {
      mission: "USS Enterprise",
      rocket: "NCC",
      target: "Kepler-442 b",
      launchDate: "Jlapulivara",
    };

    test("It should response 201 created", async () => {
      const response = await request(app) //supertest
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("it should test missing ...", async () => {
      const response = await request(app) //supertest
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("it should test invalid dates ...", async () => {
      const response = await request(app) //supertest
        .post("/v1/launches")
        .send(completeLaunchErrorDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
