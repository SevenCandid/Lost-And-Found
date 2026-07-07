-- Add missing UPDATE policy to push_subscriptions
CREATE POLICY "Users can update their own subscriptions"
    ON push_subscriptions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
