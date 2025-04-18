import DetailTaskClient from "../DetailTaskClient";
export default function Page(props: any) {
  const id = props.params.id;
  return <DetailTaskClient taskId={id} />;
}