# Utility functions
def is_valid_email(email):
    return "@" in email and "." in email.split("@")[-1]
