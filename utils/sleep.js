const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

// promise, async, await弱い

// この関数をエキスポートする
module.exports = sleep;
