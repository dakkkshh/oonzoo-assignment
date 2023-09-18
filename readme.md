Routes:

GET http://localhost:3000/api/user : If authenticated will return the user object

POST http://localhost:3000/api/user/login : Accepts “email” and “password” and assigns a JWT token to the user

POST http://localhost:3000/api/user/signup : Accepts “name”, “email”, “password”

GET http://localhost:3000/api/user/logout : If user is logged in logs out the user and also clears the cookie

GET http://localhost:3000/api/product : Returns all the products from the DB default page number is 1 and limit is 10. Can be changed using below structure: http://localhost:3000/api/product?page=2&limit=5

GET http://localhost:3000/api/product/mongoId : Returns the particular product details

POST http://localhost:3000/api/product/create : Only authenticated user can call this API and it accepts “name”, “description”, “price”