
import { requestPageMetadata } from './client/DataClient';
import { injectErrorMessage } from './ui/Error';
import { injectUiComponent } from './ui/CalcComponent';
import { injectStyleComponent } from './ui/StyleLoad';

requestPageMetadata().then(async (response) => {

    await injectStyleComponent();
    if(response.error) injectErrorMessage(response);
    else injectUiComponent(response);

})
