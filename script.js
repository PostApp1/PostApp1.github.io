// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCmoCBKxxd2Bb-zXIPUJ7KkpU6YD87KVbM",
    authDomain: "appy-62b54.firebaseapp.com",
    databaseURL: "https://appy-62b54-default-rtdb.firebaseio.com",
    projectId: "appy-62b54",
    storageBucket: "appy-62b54.firebasestorage.app",
    messagingSenderId: "492189644834",
    appId: "1:492189644834:web:7a320b550c0fa35a86b27b",
    measurementId: "G-13W9SSYDCL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const postContent = document.getElementById('postContent');
    const postBtn = document.getElementById('postBtn');
    const postsList = document.getElementById('postsList');
    const notification = document.getElementById('notification');

    // Function to show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Event listener for the post button
    postBtn.addEventListener('click', function() {
        const content = postContent.value.trim();
        
        if (content) {
            // Create new post object
            const newPost = {
                content: content,
                date: new Date().toLocaleString(),
                timestamp: Date.now()
            };
            
            // Add to Firebase database
            const postsRef = database.ref('posts');
            const newPostRef = postsRef.push();
            
            newPostRef.set(newPost)
                .then(() => {
                    // Clear textarea
                    postContent.value = '';
                    showNotification('Post published successfully!');
                })
                .catch((error) => {
                    console.error("Error adding post: ", error);
                    showNotification('Error publishing post. Please try again.');
                });
        } else {
            showNotification('Please write something before posting!');
        }
    });
    
    // Function to display posts
    function displayPosts(posts) {
        if (posts.length === 0) {
            postsList.innerHTML = '<div class="empty-posts">No posts yet. Share your first thought!</div>';
            return;
        }
        
        // Sort posts by timestamp (newest first)
        posts.sort((a, b) => b.timestamp - a.timestamp);
        
        postsList.innerHTML = '';
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-content">${escapeHtml(post.content)}</div>
                <div class="post-date"><i class="far fa-clock"></i> Posted on ${post.date}</div>
            `;
            postsList.appendChild(postElement);
        });
    }
    
    // Helper function to escape HTML (prevent XSS)
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Listen for changes in the Firebase database
    const postsRef = database.ref('posts');
    postsRef.on('value', (snapshot) => {
        const postsData = snapshot.val();
        const posts = [];
        
        if (postsData) {
            Object.keys(postsData).forEach(key => {
                posts.push({
                    id: key,
                    ...postsData[key]
                });
            });
        }
        
        displayPosts(posts);
    });
    
    // Also listen for errors
    postsRef.on('value', () => {}, (error) => {
        console.error("Error reading from database: ", error);
        postsList.innerHTML = '<div class="empty-posts">Error loading posts. Please check your connection.</div>';
    });
});