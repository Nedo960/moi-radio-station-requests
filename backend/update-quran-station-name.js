require('dotenv').config();
const { Pool } = require('pg');

const updateQuranStationName = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();

  try {
    console.log('🔄 Updating Quran Station name in database...');

    // Update the user's full name
    const result = await client.query(
      `UPDATE users
       SET full_name = $1
       WHERE employee_number = $2
       RETURNING *`,
      ['📖 محطة القرآن الكريم', '10001']
    );

    if (result.rowCount > 0) {
      console.log('✅ Successfully updated user:');
      console.log(`   Employee Number: ${result.rows[0].employee_number}`);
      console.log(`   New Full Name: ${result.rows[0].full_name}`);
      console.log(`   Role: ${result.rows[0].role}`);
    } else {
      console.log('⚠️  No user found with employee number 10001');
    }

  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

updateQuranStationName().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
