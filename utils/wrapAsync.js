
module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); // Ensure async errors are passed to next
    };
};
