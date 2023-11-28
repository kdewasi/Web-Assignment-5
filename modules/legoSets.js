require('dotenv').config();
const Sequelize = require('sequelize');

// Create Sequelize instance
let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Define Theme model
const Theme = sequelize.define(
  'Theme',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

// Define Set model
const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

// Set relationship between Set and Theme
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Function to initialize the database
async function initialize() {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
  } catch (err) {
    console.error('Error synchronizing database:', err);
    throw err;
  }
}

// Function to get all sets with themes
async function getAllSets() {
  try {
    const sets = await Set.findAll({ include: [Theme] });
    return sets;
  } catch (error) {
    console.error('Error getting all sets:', error);
    throw error;
  }
}

// Function to get a set by set number with theme
async function getSetByNum(setNum) {
  try {
    const set = await Set.findOne({
      where: { set_num: setNum },
      include: [Theme],
    });
    if (set) {
      return set;
    } else {
      throw new Error(`Set not found with set_num: ${setNum}`);
    }
  } catch (error) {
    console.error('Error getting set by set_num:', error);
    throw error;
  }
}

// Function to get sets by theme
async function getSetsByTheme(theme) {
  try {
    const sets = await Set.findAll({
      include: [Theme],
      where: {
        '$Theme.name$': {
          [Sequelize.Op.iLike]: `%${theme}%`,
        },
      },
    });

    if (sets.length > 0) {
      return sets;
    } else {
      throw new Error(`No sets found for theme: ${theme}`);
    }
  } catch (error) {
    console.error('Error getting sets by theme:', error);
    throw error;
  }
}

// Function to add a set
const addSet = async (setData) => {
  try {
    await Set.create(setData);
  } catch (err) {
    throw err.errors[0].message;
  }
};

// Function to get all themes
const getAllThemes = async () => {
  try {
    const themes = await Theme.findAll();
    return themes;
  } catch (err) {
    throw err;
  }
};

// Function to edit a set
const editSet = async (setNum, setData) => {
  try {
    await Set.update(setData, { where: { set_num: setNum } });
  } catch (err) {
    throw err.errors[0].message;
  }
};

// Function to delete a set
const deleteSet = async (setNum) => {
  try {
    await Set.destroy({ where: { set_num: setNum } });
  } catch (err) {
    throw err.errors[0].message;
  }
};

// Export the functions
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };
