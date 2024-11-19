import { useMutation, useQueryClient } from "@tanstack/react-query";
import todoService, { Todo } from "../services/todoService";
import { CACHE_KEY_TODOS } from "../constants";

interface AddTodoContext {
  previousTodos: Todo[];
}

const useAddTodo = (onAdd: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<Todo, Error, Todo, AddTodoContext>({
    mutationFn: todoService.post,
    onMutate: (newTodo: Todo) => {
      const previousTodos =
        queryClient.getQueryData<Todo[]>(CACHE_KEY_TODOS) || [];
      // Approach 1: Invalidate the cache [incapable b/c json placeholder is not real api]
      // queryClient.invalidateQueries({
      //   queryKey: CACHE_KEY_TODOS,
      // });

      // Approach 2: Update the data in the cache directly
      queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos) => [
        newTodo,
        ...(todos || []),
      ]);
      onAdd();
      return { previousTodos };
    },

    onSuccess: (savedToDo, newTodo) => {
      queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos) =>
        todos?.map((todo) => (todo === newTodo ? savedToDo : todo))
      );
    },

    onError: (error, NewTodo, context) => {
      if (!context) return;
      queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, context.previousTodos);
    },
  });
};

export default useAddTodo;
