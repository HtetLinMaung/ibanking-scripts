const { workerEach, timeout, asyncEach } = require("./index");
const { default: runParallel } = require("./run-parallel");

const main = async () => {
  // const chars = await workerEach(
  //   { name: "hlm", age: 26 },
  //   async (value, index, args) => {
  //     await timeout(Math.random() % 3);
  //     console.log(`${index}: ${value}`);
  //     console.log(args);
  //     return value + "sth";
  //   },
  //   {
  //     message: "hello",
  //   }
  // );
  // console.log(`final results: ${JSON.stringify(chars, null, 2)}`);
  // const obj = await asyncEach({ name: "hlm", age: 26 }, async (value, key) => {
  //   await timeout(Math.random() % 10);
  //   console.log(`${key}: ${value}`);
  //   return "sth";
  // });
  // console.log(`final result: ${JSON.stringify(obj, null, 2)}`);

  // runParallel(
  //   [
  //     1000000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
  //     100000, 100000,
  //   ],
  //   "./worker.js"
  // );
  // console.log("not blocking");
  const doubleNums = await asyncEach(
    { a: 1, b: 2, c: 3, d: 4 },
    async (v, k) => {
      await timeout(1);
      console.log(`key: ${k}`);
      return v * 2;
    },
    3
  );
  console.log(doubleNums);
};

main();
