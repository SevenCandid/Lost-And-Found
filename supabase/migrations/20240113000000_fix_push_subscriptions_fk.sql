-- Drop the incorrect foreign key constraint
ALTER TABLE push_subscriptions
DROP CONSTRAINT push_subscriptions_user_id_fkey;

-- Add the correct foreign key constraint to the users table
ALTER TABLE push_subscriptions
ADD CONSTRAINT push_subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
