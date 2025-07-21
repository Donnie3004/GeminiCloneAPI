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


<img width="1100" height="841" alt="image" src="https://github.com/user-attachments/assets/c66c1d7f-7ee3-411f-a8ea-f189362d7c7e" />


<img width="1332" height="845" alt="image" src="https://github.com/user-attachments/assets/c22c4eac-2f57-49d3-96a6-dd9242af0931" />


<img width="1002" height="847" alt="image" src="https://github.com/user-attachments/assets/a42eddb9-e7bb-44b9-8e52-0c7d9983de72" />


<img width="1195" height="842" alt="image" src="https://github.com/user-attachments/assets/d69d3366-55bc-4f68-b826-c23f4d9c69c9" />


<img width="1147" height="830" alt="image" src="https://github.com/user-attachments/assets/5581354c-9ced-4f52-aa60-1b7bd2b42c0a" />


<img width="1197" height="837" alt="image" src="https://github.com/user-attachments/assets/fcd4ab7b-fcd9-4ec7-88a3-abfadaa99977" />


<img width="1461" height="857" alt="image" src="https://github.com/user-attachments/assets/2388cfca-443c-4a56-b9da-cab793313881" />


<img width="1127" height="837" alt="image" src="https://github.com/user-attachments/assets/c80bef28-0bab-45ee-ac1b-1aeb0c630bdd" />
