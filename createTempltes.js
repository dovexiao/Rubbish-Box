const tsxTpl = name => `import React from 'react';
import {View, Text} from 'react-native';

const ${name} = () => {
  return (
    <View>
      <Text>${name} is working now</Text>
    </View>
  );
};

export default ${name};
`;
const getLowerName = name =>
  name
    .split('-')
    .reduce((a, b) => a + b.charAt(0).toUpperCase() + b.slice(1), '');
const getTsxTpl = name => tsxTpl(getLowerName(name));

const demoTpl = (name, path) => `import React from 'react';
import ${name} from './${path}';

const ${name}Demo = () => {
  return <${name} />;
};

export default ${name}Demo;
`;
const getDemoTpl = name => demoTpl(getLowerName(name), name);

const indexTpl = (name, path) => `import ${name} from './${path}';

export default ${name};
`;

const getIndexTpl = name => indexTpl(getLowerName(name), name);

module.exports = {
  getTsxTpl,
  getDemoTpl,
  getIndexTpl,
};
