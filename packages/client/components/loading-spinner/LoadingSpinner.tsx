interface ILoadingSpinnerProps {
  loading: boolean;
}

/** Renders a Bootstrap loading spinner. */
export function LoadingSpinner({ loading }: ILoadingSpinnerProps) {
  return loading ? (
    <div className="text-center">
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  ) : null;
}
