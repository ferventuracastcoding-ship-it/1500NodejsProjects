function checkPasswordStrength(password) {
    // Make sure the input is a string.
    if (typeof password !== "string") {
        return {
            score: 0,
            level: "Invalid Password",
            message: "Password must be a string."
        };
    }

    // Define password requirements.
    const requirements = {
        minLength: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        specialCharacter: /[^A-Za-z0-9]/.test(password)
    };

    // Calculate the score.
    const score =
        Object.values(requirements)
            .filter(Boolean)
            .length;

    // Determine password strength.
    let level;

    if (score === 5) {
        level = "Strong Password 🔥";
    } else if (score >= 3) {
        level = "Medium Password";
    } else {
        level = "Weak Password";
    }

    // Return structured information.
    return {
        score,
        maximumScore: 5,
        level,
        requirements
    };
}


// Test the function.
const result =
    checkPasswordStrength("NodeJS@2026Password");

console.log(result);
