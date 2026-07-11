import { execSync } from 'child_process';
try {
  const out = execSync('psql "postgresql://postgres.egcebufppxrvmmtmexiz:Jvpe3JSeUDZfDgfk@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres" -c "SELECT 1"');
  console.log('SUCCESS:', out.toString());
} catch(e) {
  console.error(e.message);
  console.error(e.stderr?.toString());
}
