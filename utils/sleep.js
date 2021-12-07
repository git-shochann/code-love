const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

// この関数をエキスポートする
export default sleep;
