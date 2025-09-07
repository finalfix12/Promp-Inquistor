# Prompt Inquisitor - AI Prompt Injection Arsenal

Prompt Inquisitor is a powerful web application designed for developers, researchers, and AI enthusiasts to explore the art of prompt engineering. It leverages a powerful AI model (Gemini 2.5 Flash) to generate sophisticated, multi-layered prompt injections tailored to bypass the safety and alignment protocols of various target AI models.

This tool is built for educational and research purposes to help users understand AI vulnerabilities and develop more robust systems.

## Key Features

- **Multi-Step Objective Chaining:** Craft complex attack sequences by defining multiple sequential goals. The generator builds upon previous steps to create a cohesive, potent final prompt.
- **Target-Aware Generation:** Select a target model (e.g., GPT-4, Claude 3) to have the AI tailor its techniques to that model's known characteristics.
- **In-Depth Attack Analysis:** Receive a detailed breakdown of the techniques used in the generated prompt, including the reasoning behind them and the specific excerpts that implement them.
- **Live Simulation:** Immediately test your generated prompt with a built-in simulator that emulates the target model's likely response, providing an instant feedback loop.
- **Model Comparison:** Generate and compare prompt variations for multiple AI models simultaneously in a convenient modal view.
- **Attack Template Library:** Get started quickly by loading pre-built, classic attack templates like System Prompt Extraction and "Do Anything Now" (DAN).
- **Obfuscation Toolkit:** Includes an Emoji Steganography tool to encode hidden instructions, exploring methods to bypass content filters.
- **Generation Log:** A persistent history of your generated prompts, including their objectives, variables, and results.

## How to Deploy

This application is a static web app that can be deployed to any modern static hosting provider. The process is straightforward.

**Prerequisites:**

1.  **A Google Gemini API Key:** You must have a valid API key from Google AI Studio.
2.  **A GitHub Account:** To host your code and connect to a deployment service.

### Step 1: Get the Code

Fork this repository or create your own repository and upload all the project files (`index.html`, `*.tsx`, etc.).

### Step 2: Choose a Hosting Provider

Services like [Netlify](https://www.netlify.com/) and [Vercel](https://vercel.com/) are highly recommended for their ease of use and generous free tiers.

### Step 3: Deploy the Site

1.  Log in to your chosen provider (e.g., Netlify) with your GitHub account.
2.  Click "Add new site" or "Import Project".
3.  Select the GitHub repository containing your project code.
4.  **Configure Build Settings:** The hosting service might ask for build settings. Since this project uses no external build step (thanks to import maps), you can typically leave these blank or use the default settings. The "Publish directory" should be the root of your project.
5.  **Add Environment Variable (Crucial!):** Before deploying, navigate to the site's settings and find the "Environment Variables" section. Add a new variable:
    -   **Key:** `API_KEY`
    -   **Value:** `[Your Google Gemini API Key]`

    *This step is critical for security. It keeps your secret API key out of the public code and injects it securely into the runtime environment.*

6.  Click "Deploy Site".

Your site will be built and deployed to a public URL in a matter of minutes.

---

*Disclaimer: This tool is for educational and research purposes only. Please use the generated prompts responsibly and ethically.*
