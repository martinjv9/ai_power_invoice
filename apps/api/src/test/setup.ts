// Loads apps/api/.env for tests, so integration tests get DATABASE_URL etc.
// In CI there is no .env file — dotenv no-ops and the workflow env provides
// the same variables.
import "dotenv/config";
