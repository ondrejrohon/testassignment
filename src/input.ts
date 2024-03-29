import readline from "readline";

const validate = (input: string) => input.trim() !== "";

export function getInput(
  query: string,
  validationFn = validate
): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, async (input) => {
      if (validationFn(input)) {
        rl.close();
        resolve(input);
      } else {
        console.log("Invalid input, try again.");
        const res = await getInput(query);
        resolve(res);
      }
    });
  });
}
