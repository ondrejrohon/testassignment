import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const validate = (input: string) => input.trim() !== "";

export function getInput(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (input) => {
      if (validate(input)) {
        console.log(`You entered: ${input}`);
        rl.close();
        resolve(input);
      } else {
        console.log("Invalid input, try again.");
        getInput(query);
      }
    });
  });
}
