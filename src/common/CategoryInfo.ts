/**
 Common data for different categories
 */

export const knownCategories = ['waste', 'recycling', 'tree', 'junk'];

export const iconClass = {
  waste: 'fa-trash',
  recycling: 'fa-recycle',
  tree: 'fa-tree',
  junk: 'fa-truck',
};

export const localizationKey = {
  waste: 'Trash_And_Lawn',
  recycling: 'Recycling',
  tree: 'Tree_Waste',
  junk: 'Junk'
};

let tempObj = {};
knownCategories.map(c => ({
    icon: iconClass[c],
    localizationKey: localizationKey[c]
  }))
  .forEach((info, i) => {
    tempObj[knownCategories[i]] = info;
  });
export const categoryInfo = tempObj;