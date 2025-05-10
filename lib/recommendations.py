import random
from typing import List, Dict, Any

def get_random_recommendations(db, interests: List[str] = None, limit: int = 6) -> List[Dict[str, Any]]:
    """
    Generate random course recommendations, optionally filtered by user interests.
    
    Args:
        db: MongoDB database connection
        interests: List of user interests
        limit: Maximum number of recommendations to return
        
    Returns:
        List of recommended courses
    """
    # Get all courses from the database
    courses = list(db.collection("courses").find())
    
    # If no courses found, return empty list
    if not courses:
        return []
    
    # If user has interests, filter courses that match those interests
    if interests and len(interests) > 0:
        filtered_courses = []
        for course in courses:
            # Check if any of the user's interests are in the course skills
            skills = course.get("skills", "").lower()
            if any(interest.lower() in skills for interest in interests):
                filtered_courses.append(course)
        
        # If we have filtered courses, use those; otherwise fall back to all courses
        if filtered_courses:
            courses = filtered_courses
    
    # Randomly select up to 'limit' courses
    if len(courses) <= limit:
        return courses
    else:
        return random.sample(courses, limit)
