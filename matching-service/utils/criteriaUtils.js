// utils/criteriaUtils.js

module.exports = {
    /**
     * check whther two users can match
     * @param {Object} user1
     * @param {Object} user2 
     * @param {Object} question
     * @returns {Boolean}
     */
    matchCriteria(user1, user2, question) {
      // suppose user1 and user2 includes catagery and difficulty
      // eg. user1.interests && user1.preferredDifficulty
  
      const categoryMatch = user1.interests.includes(question.category) &&
                            user2.interests.includes(question.category);
  
      const difficultyMatch = user1.preferredDifficulty === question.difficulty &&
                              user2.preferredDifficulty === question.difficulty;
  
      // other criteria
      // const otherCriteriaMatch = someOtherCriteriaFunction(user1, user2);
  
      return categoryMatch && difficultyMatch;
    }
  };
  