# GeminiCloneAPI
Gemini-style backend system that enables user-specific chatrooms, OTP-based login, Gemini API-powered AI conversations, and subscription handling via Stripe.

Currently complete API works in the local environment. 

How I use the API:-

1. Starts the Redis server using Docker.
2. From the root directory, start the  express and DB server in development mode: npm run dev
3. I manually run the queue.worker.js using the command from the root directory: node src/utils/messageQueue/queue.worker.js
4. I run the command for Stripe payment in the terminal using the command: stripe listen --forward-to localhost:3000/webhook

The project had been tested in Postman for the complete workflow.
The path webhook/stripe is not needed as payment is done by webhook UI in the web by entering dummy data. So I have skipped that endpoint.

Postman tested link : https://.postman.co/workspace/My-Workspace~5cd8b8e3-7e14-4373-873d-1e467266ecc2/collection/37515370-2bb0aa92-3487-4ba5-a339-f7895923c2e4?action=share&creator=37515370


DB Details 

There are 4 schemas 
1. users : for user related work
2. chatrooms : for chatrooms
3. messages : for storing messages 
4. otps : for storing otps (I am doing hard delete so this will be empty at end of the verification for particular mobile number).


Features Integrated:-
1. JWT authentication.
2. Caching where it is required.
3. Proper status code implementation.
4. Stripe integration for smooth payment (sandbox mode).
5. Gemini API integration for AI response.
6. BullMQ used for queuing.
7. For local Redis is started in DOCKER.
8. Language & packages: Node.js ; PostgreSql ; BullMQ, Redis, Stripe, GeminiAPI.


Archietecture used : Controller - Routes - Repository 

Controller takes care of all the logic implementation for each functionality.
Routes takes care of endpoint implementation.
Repository takes care of DB operations.

<img width="1218" height="857" alt="image" src="https://github.com/user-attachments/assets/620af337-0633-4b99-8f95-3391f10d8fae" />

