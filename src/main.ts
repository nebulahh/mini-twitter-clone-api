import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import { schema } from './schema';
import { createContext } from './context';
import dotenv from 'dotenv';

dotenv.config();

function main() {
  const yoga = createYoga({
    schema,
    context: createContext,
    graphqlEndpoint: '/'
  });
  const server = createServer(yoga);
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.info(
      `Server is running on http://localhost:${PORT}/api${yoga.graphqlEndpoint}`
    );
  });
}

main();
