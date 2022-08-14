const URL = "https://zyh0ypgh08.execute-api.eu-west-1.amazonaws.com/prod/todos";

export const deleteItem = async (apiKey, id) => {
  await fetch(`${URL}?records[]=${id}`, {
    method: "DELETE",
    headers: {
      "X-Api-Key": apiKey,
    },
  });
};

export const getAllTodos = async (apiKey) => {
  const response = await fetch(URL, {
    headers: {
      "X-Api-Key": apiKey,
    },
  });
  return await response.json();
};

export const addItem = async (text, apiKey) => {
  await fetch(URL, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            Status: "Todo",
            Tags: [],
            Text: text,
          },
        },
      ],
    }),
  });
};

export const updateItem = async (apiKey, id, Status, Text, Tags) => {
  await fetch(URL, {
    method: "PATCH",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      records: [
        {
          id,
          fields: {
            Status,
            Tags,
            Text,
          },
        },
      ],
    }),
  });
};

export function buildTagMap(todos) {
  function createHirarchy(tag) {
    const heirarchy = {
      name: tag.split("::")[0],
      children: tag.split("::")[1] && createHirarchy(tag.split("::")[1]),
    };
    return heirarchy;
  }
  function buildTagsStructure(tags) {
    const tagsStructure = [];
    tags.forEach((tag) => {
      tagsStructure.push(createHirarchy(tag));
    });
    return tagsStructure;
  }
  const tagMap = [];
  todos.forEach((todo) => {
    if (todo.fields.Tags) tagMap.push(buildTagsStructure(todo.fields.Tags));
  });
  return tagMap;
}

export function applyHierarchicalFilter(data, filter) {
  console.log(data, filter);
  const result = [];

  function shouldDisplayitem(item) {
    if (item.name.includes(filter)) {
      console.log("name", item.name, "filter", filter);
      return true;
    }
    if (!item.children) {
      return false;
    }
    return shouldDisplayitem(item.children);
  }

  data.forEach((item, index) => {
    item.forEach((tag) => {
      result[index] = shouldDisplayitem(tag);
    });
  });
  return result;
}
