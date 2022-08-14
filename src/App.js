import * as React from "react";
import "./App.css";

import {
  getAllTodos,
  deleteItem,
  addItem,
  updateItem,
  buildTagMap,
  applyHierarchicalFilter,
} from "./api";

const apiKeyLocalStorageKey = "apiKey";

const getNewStatus = (status) => {
  return status === "Todo" ? "Done" : "Todo";
};

const clear = (input) => {
  input.value = "";
};

function ToDoItem({
  id,
  status,
  tags,
  text,
  onItemDelete,
  updateListItem,
  shouldHide,
}) {
  const isDone = status === "Done";
  return (
    <div className={`App-todo-item ${shouldHide ? "hide" : ""}`}>
      <input
        type="checkbox"
        checked={isDone}
        onChange={() => {
          updateListItem(id, getNewStatus(status));
        }}
      />
      <span> {text}</span>
      <span>
        Tags:
        {tags.map((tag, i) => [i > 0 && ", ", <span key={i}>{tag}</span>])}
      </span>

      <input
        placeholder="Add Tag"
        onKeyDown={(textEvent) => {
          if (textEvent.key === "Enter") {
            updateListItem(id, status, text, [...tags, textEvent.target.value]);
            clear(textEvent.target);
          }
        }}
      ></input>
      <button onClick={() => onItemDelete(id)}>X</button>
    </div>
  );
}

function App() {
  const [apiKey, setApiKey] = React.useState("");
  const [todos, setTodos] = React.useState([]);
  const [updated, setUpdated] = React.useState(0);
  const [newItemText, setNewItemText] = React.useState("");
  const [tagsStruct, setTagsStruct] = React.useState(buildTagMap(todos));
  const [filters, setFilters] = React.useState([]);

  React.useEffect(() => {
    const apiKeyFromLocalStorage =
      localStorage.getItem(apiKeyLocalStorageKey) ||
      "Zamiw7wWFU2ADFAylHmwK1AZP7LPhRRP3inB2BqL";

    if (apiKeyFromLocalStorage) {
      localStorage.setItem(apiKeyLocalStorageKey, apiKeyFromLocalStorage);
      setApiKey(apiKeyFromLocalStorage);
    }
  }, []);

  React.useEffect(() => {
    if (apiKey) {
      getAllTodos(apiKey)
        .then((res) => {
          setTodos(res.records);
          setTagsStruct(buildTagMap(res.records));
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [apiKey, updated]);

  const onItemDelete = (id) => {
    deleteItem(apiKey, id);
    setUpdated(updated + 1);
  };
  const updateList = () => {
    setTagsStruct(todos);
    setUpdated(updated + 1);
  };
  const updateListItem = (id, status, text, tags) => {
    updateItem(apiKey, id, status, text, tags).then(() => {
      updateList();
    });
  };

  return (
    <div className="App">
      <h1>ToDO App</h1>
      <header className="App-header">
        <input
          placeholder="Filter By Tag"
          onInput={(textEvent) => {
            setFilters(
              applyHierarchicalFilter(tagsStruct, textEvent.target.value)
            );
          }}
        ></input>
        <div className="Todo-list">
          {todos.length > 0 ? (
            todos.map((todo, index) => {
              return (
                <ToDoItem
                  status={todo.fields.Status}
                  id={todo.id}
                  tags={todo.fields.Tags}
                  text={todo.fields.Text}
                  onItemDelete={onItemDelete}
                  updateListItem={updateListItem}
                  shouldHide={
                    filters.length > 0 &&
                    (filters[index] === false || todo.fields.Tags.length === 0)
                  }
                />
              );
            })
          ) : (
            <span>No items</span>
          )}

          <input
            placeholder="Add New Task"
            onKeyUp={(textEvent) => {
              if (textEvent.key === "Enter") {
                addItem(newItemText, apiKey)
                  .then(() => {
                    clear(textEvent.target);
                    setNewItemText("");
                    updateList();
                  })
                  .catch((e) => console.error(e));
              }
              setNewItemText(textEvent.target.value);
            }}
          ></input>
        </div>
      </header>
    </div>
  );
}

export default App;
