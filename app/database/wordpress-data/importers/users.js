import { getMysqlConnection, sql } from '../lib/db.js';

export async function importUsers() {
    const mysqlConnection = await getMysqlConnection();
    
    try {
        console.log('Importing users...');
        const [users] = await mysqlConnection.execute(`
            SELECT 
                u.ID,
                u.user_email,
                u.display_name,
                u.user_nicename,
                um_firstname.meta_value as first_name,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM wp_usermeta 
                        WHERE user_id = u.ID 
                        AND meta_key = 'wp_capabilities' 
                        AND meta_value LIKE '%administrator%'
                    ) THEN 'admin'
                    WHEN EXISTS (
                        SELECT 1 FROM wp_usermeta 
                        WHERE user_id = u.ID 
                        AND meta_key = 'wp_capabilities' 
                        AND (meta_value LIKE '%wcfm_vendor%' OR meta_value LIKE '%shop_vendor%')
                    ) THEN 'vendor'
                    ELSE 'user'
                END as role
            FROM wp_users u
            LEFT JOIN wp_usermeta um_firstname ON u.ID = um_firstname.user_id AND um_firstname.meta_key = 'first_name'
            WHERE user_email != ''
        `);

        for (const user of users) {
            // Convert role to PostgreSQL array
            const roles = user.role === 'user' 
                ? '{user}'
                : `{${user.role},user}`;

            await sql`
                INSERT INTO users (name, email, password, roles) 
                VALUES (
                    ${user.first_name || user.display_name},
                    ${user.user_email},
                    ${'INVALID_HASH_REQUIRES_RESET'},
                    ${roles}::user_role[]
                )
                ON CONFLICT (email) DO UPDATE 
                SET roles = ${roles}::user_role[]
            `;
        }

        console.log('Users import completed successfully!');
    } finally {
        await mysqlConnection.end();
    }
} 