import { compose } from "@/middlewares/compose";
import withApiKey from "@/middlewares/withApiKey";
import withPostOnly from "@/middlewares/withPostOnly";

const pipeline = compose(withPostOnly, withApiKey);

export default pipeline;
