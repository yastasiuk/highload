import random
import string


def random_string(length=10):
    """Generate a random string of letters and digits."""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(length))


def generate_unique_urls(base_url, count=500):
    unique_urls = set()

    while len(unique_urls) < count:
        unique_urls.add(base_url + '/' + random_string())

    return unique_urls


if __name__ == "__main__":
    urls = generate_unique_urls("http://web:5005")
    with open("urls.txt", "w") as f:
        for url in urls:
            f.write(url + "\n")
