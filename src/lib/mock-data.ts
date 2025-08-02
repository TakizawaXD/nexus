import type { Profile, PostWithAuthor, CommentWithAuthor, MockUser } from './types';

export const MOCK_PROFILES: Profile[] = [
    {
        id: '1',
        username: 'neo',
        full_name: 'The One',
        avatar_url: 'https://placehold.co/100x100.png',
        followers_count: 1000,
        following_count: 1
    },
    {
        id: '2',
        username: 'trinity',
        full_name: 'Trinity',
        avatar_url: 'https://placehold.co/100x100.png',
        followers_count: 500,
        following_count: 1
    },
    {
        id: '3',
        username: 'morpheus',
        full_name: 'Morpheus',
        avatar_url: 'https://placehold.co/100x100.png',
        followers_count: 800,
        following_count: 2
    }
];

export const MOCK_USER: MockUser = {
    id: '1',
    email: 'neo@nexo.com',
    username: 'neo',
    full_name: 'The One',
    avatar_url: 'https://placehold.co/100x100.png',
};

export const MOCK_POSTS: PostWithAuthor[] = [
    {
        id: 'p1',
        content: 'I know Kung Fu.',
        image_url: null,
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        author: MOCK_PROFILES[0],
        user_has_liked_post: true,
        likes_count: 10,
        comments_count: 2
    },
    {
        id: 'p2',
        content: 'Follow the white rabbit.',
        image_url: 'https://placehold.co/600x400.png',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        author: MOCK_PROFILES[1],
        user_has_liked_post: false,
        likes_count: 15,
        comments_count: 1
    },
    {
        id: 'p3',
        content: 'This is your last chance. After this, there is no turning back. You take the blue pill—the story ends, you wake up in your bed and believe whatever you want to believe. You take the red pill—you stay in Wonderland, and I show you how deep the rabbit hole goes.',
        image_url: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        author: MOCK_PROFILES[2],
        user_has_liked_post: false,
        likes_count: 25,
        comments_count: 0
    }
];

export const MOCK_COMMENTS: CommentWithAuthor[] = [
    {
        id: 'c1',
        post_id: 'p1',
        content: 'Show me.',
        created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        author: MOCK_PROFILES[2]
    },
    {
        id: 'c2',
        post_id: 'p1',
        content: 'Whoa.',
        created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        author: MOCK_PROFILES[1]
    },
    {
        id: 'c3',
        post_id: 'p2',
        content: 'I\'m on my way.',
        created_at: new Date(Date.now() - 1000 * 60 * 59).toISOString(),
        author: MOCK_PROFILES[0]
    }
];
