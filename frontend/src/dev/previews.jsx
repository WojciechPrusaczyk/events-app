import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import EditEvent from "../containers/createEvent/EditEvent";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/EditEvent">
                <EditEvent/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews