import app from './App';
import { runMigrations, runSeeds } from './database/Connection';

const port = process.env.PORT || 3333;

if (process.env.NODE_ENV === 'production') {
  (async () => {
    await runMigrations();
    await runSeeds();
  })();
}

app.listen(port, () => {
  console.log(`Server listen on http://localhost:${port}/`);
});
