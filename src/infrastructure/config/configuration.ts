import { join } from 'path';
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';

export default () => {
  const CONFIG_FILE =
    process.env.ENV_CONFIG || join(__dirname, 'app.config.yaml');
  return yaml.load(readFileSync(CONFIG_FILE, 'utf-8')) as Record<string, any>;
};
