import { patch, createElement, setAttribute, render, Component } from "./renderer";

class TodoItem extends Component {
  render() {
    return (
      <li className="todo__item">
        <span>{this.props.text} - </span>
        <a href="#" onClick={this.props.onClick}>
          X
        </a>
      </li>
    );
  }
}

class Todo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      items: [],
    };
    this.handleAdd("Goal #1");
    this.handleAdd("Goal #2");
    this.handleAdd("Goal #3");
  }

  handleInput(e) {
    this.setState({
      input: e.target.value,
      items: this.state.items,
    });
  }

  handleAdd(text) {
    const newItems = [].concat(this.state.items);
    newItems.push({
      id: Math.random(),
      text,
    });
    this.setState({
      input: "",
      items: newItems,
    });
  }

  handleRemove(index) {
    const newItems = [].concat(this.state.items);
    newItems.splice(index, 1);
    this.setState({
      input: this.state.input,
      items: newItems,
    });
  }

  render() {
    return (
      <div className="todo">
        <ul className="todo__items">
          {this.state.items.map((item, index) => (
            <TodoItem key={item.id} text={item.text} onClick={(e) => this.handleRemove(index)} />
          ))}
        </ul>
        <input type="text" onInput={(e) => this.handleInput(e)} value={this.state.input} />
        <button onClick={(e) => this.handleAdd(this.state.input)}>Add</button>
      </div>
    );
  }
}

render(<Todo />, document.getElementById("root"));
