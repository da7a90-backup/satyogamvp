-- Migration: Create blog_comments table
-- Description: Add blog comment system with nested replies and moderation

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id VARCHAR PRIMARY KEY,
    blog_post_id VARCHAR NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    parent_comment_id VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,

    -- Foreign key constraints
    CONSTRAINT fk_blog_comments_post FOREIGN KEY (blog_post_id)
        REFERENCES blog_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_comments_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_comments_parent FOREIGN KEY (parent_comment_id)
        REFERENCES blog_comments(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON blog_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON blog_comments(created_at DESC);

-- Add comment to table
COMMENT ON TABLE blog_comments IS 'Blog comments with nested replies and moderation support';
COMMENT ON COLUMN blog_comments.is_approved IS 'Comments require approval before being publicly visible';
COMMENT ON COLUMN blog_comments.parent_comment_id IS 'Parent comment ID for nested replies';
