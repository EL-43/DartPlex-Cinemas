
## Setup Instructions

1. **Database Setup**
   ```sql
   CREATE DATABASE dartplex;
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the following variables in `.env`:
     ```plaintext
     PORT=3000
     DB_HOST=your_host
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=dartplex
     ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Sync Database**
   ```bash
   node sync.js
   ```

5. **Start Server**
   ```bash
   npm start
   # OR
   nodemon server.js
   ```

## Environment Security
- Please don't commit `.env` files
- Keep `.env.example` updated with required variables **(but no real values)**
- Set up environment variables on your production server
- Use different credentials for development and production

## Contributing
1. Create a `.env` file based on `.env.example`
2. Install dependencies
3. Make your changes
4. Test locally before submitting PR